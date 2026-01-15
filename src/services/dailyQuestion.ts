import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useCoupleStore } from '@/stores/coupleStore';
import { useActivityStore } from '@/stores/activityStore';
import type { DailyPrompt, Answer, Question, DailyResponse } from '@/types';

const getTodayKey = () => new Date().toISOString().split('T')[0];

// Get today's daily question
export async function getDailyQuestion(): Promise<{
  success: boolean;
  data?: DailyResponse;
  error?: string;
}> {
  try {
    const user = useAuthStore.getState().user;
    const couple = useCoupleStore.getState().couple;

    if (!user || !couple || !couple.memberB) {
      return { success: false, error: 'Couple not complete' };
    }

    const dateKey = getTodayKey();

    // Get or create daily prompt for this couple
    let { data: prompt, error: promptError } = await supabase
      .from('daily_prompts')
      .select(`
        *,
        question:questions(*)
      `)
      .eq('couple_id', couple.id)
      .eq('date_key', dateKey)
      .single();

    // If no prompt exists, create one
    if (promptError && promptError.code === 'PGRST116') {
      // Select a random question
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select()
        .limit(1);

      if (qError || !questions?.length) {
        return { success: false, error: 'No questions available' };
      }

      const question = questions[0];

      // Create daily prompt
      const { data: newPrompt, error: createError } = await supabase
        .from('daily_prompts')
        .insert({
          couple_id: couple.id,
          date_key: dateKey,
          question_id: question.id,
        })
        .select(`
          *,
          question:questions(*)
        `)
        .single();

      if (createError) {
        return { success: false, error: createError.message };
      }

      prompt = newPrompt;
    } else if (promptError) {
      return { success: false, error: promptError.message };
    }

    // Get answers for this prompt
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select()
      .eq('couple_id', couple.id)
      .eq('date_key', dateKey);

    if (answersError) {
      return { success: false, error: answersError.message };
    }

    const myAnswer = answers?.find((a) => a.user_id === user.id);
    const partnerAnswer = answers?.find((a) => a.user_id !== user.id);
    const isUnlocked = !!myAnswer && !!partnerAnswer;

    // If just unlocked, update the prompt
    if (isUnlocked && !prompt.unlocked_at) {
      await supabase
        .from('daily_prompts')
        .update({ unlocked_at: new Date().toISOString() })
        .eq('id', prompt.id);

      // Log unlock activity
      useActivityStore.getState().logQuestionUnlock();
    }

    const response: DailyResponse = {
      prompt: {
        coupleId: prompt.couple_id,
        dateKey: prompt.date_key,
        questionId: prompt.question_id,
        question: {
          id: prompt.question.id,
          text: prompt.question.text,
          tags: prompt.question.tags || [],
        },
        createdAt: new Date(prompt.created_at),
        unlockedAt: prompt.unlocked_at ? new Date(prompt.unlocked_at) : undefined,
      },
      myStatus: myAnswer ? 'answered' : 'not_answered',
      isUnlocked,
      myAnswer: myAnswer
        ? {
            coupleId: myAnswer.couple_id,
            dateKey: myAnswer.date_key,
            userId: myAnswer.user_id,
            text: myAnswer.text,
            createdAt: new Date(myAnswer.created_at),
          }
        : undefined,
      partnerAnswer:
        isUnlocked && partnerAnswer
          ? {
              coupleId: partnerAnswer.couple_id,
              dateKey: partnerAnswer.date_key,
              userId: partnerAnswer.user_id,
              text: partnerAnswer.text,
              createdAt: new Date(partnerAnswer.created_at),
            }
          : undefined,
    };

    return { success: true, data: response };
  } catch (err) {
    return { success: false, error: 'Failed to get daily question' };
  }
}

// Submit an answer
export async function submitAnswer(
  text: string
): Promise<{ success: boolean; answer?: Answer; error?: string }> {
  try {
    const user = useAuthStore.getState().user;
    const couple = useCoupleStore.getState().couple;

    if (!user || !couple) {
      return { success: false, error: 'Not in a couple' };
    }

    const dateKey = getTodayKey();

    // Check if already answered
    const { data: existing } = await supabase
      .from('answers')
      .select()
      .eq('couple_id', couple.id)
      .eq('date_key', dateKey)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return { success: false, error: 'Already answered today' };
    }

    // Submit answer
    const { data, error } = await supabase
      .from('answers')
      .insert({
        couple_id: couple.id,
        date_key: dateKey,
        user_id: user.id,
        text,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log activity
    useActivityStore.getState().logQuestionSubmit();

    // Check if both answered now
    const { data: allAnswers } = await supabase
      .from('answers')
      .select()
      .eq('couple_id', couple.id)
      .eq('date_key', dateKey);

    if (allAnswers?.length === 2) {
      // Update prompt as unlocked
      await supabase
        .from('daily_prompts')
        .update({ unlocked_at: new Date().toISOString() })
        .eq('couple_id', couple.id)
        .eq('date_key', dateKey);

      // Log unlock activity
      useActivityStore.getState().logQuestionUnlock();
    }

    const answer: Answer = {
      coupleId: data.couple_id,
      dateKey: data.date_key,
      userId: data.user_id,
      text: data.text,
      createdAt: new Date(data.created_at),
    };

    return { success: true, answer };
  } catch (err) {
    return { success: false, error: 'Failed to submit answer' };
  }
}

// Get revealed answers (only if unlocked)
export async function getRevealedAnswers(): Promise<{
  success: boolean;
  myAnswer?: Answer;
  partnerAnswer?: Answer;
  error?: string;
}> {
  try {
    const user = useAuthStore.getState().user;
    const couple = useCoupleStore.getState().couple;

    if (!user || !couple) {
      return { success: false, error: 'Not in a couple' };
    }

    const dateKey = getTodayKey();

    // Check if unlocked
    const { data: prompt } = await supabase
      .from('daily_prompts')
      .select()
      .eq('couple_id', couple.id)
      .eq('date_key', dateKey)
      .single();

    if (!prompt?.unlocked_at) {
      return { success: false, error: 'Not unlocked yet' };
    }

    // Get both answers
    const { data: answers, error } = await supabase
      .from('answers')
      .select()
      .eq('couple_id', couple.id)
      .eq('date_key', dateKey);

    if (error || answers?.length !== 2) {
      return { success: false, error: 'Answers not available' };
    }

    const myAnswerData = answers.find((a) => a.user_id === user.id)!;
    const partnerAnswerData = answers.find((a) => a.user_id !== user.id)!;

    return {
      success: true,
      myAnswer: {
        coupleId: myAnswerData.couple_id,
        dateKey: myAnswerData.date_key,
        userId: myAnswerData.user_id,
        text: myAnswerData.text,
        createdAt: new Date(myAnswerData.created_at),
      },
      partnerAnswer: {
        coupleId: partnerAnswerData.couple_id,
        dateKey: partnerAnswerData.date_key,
        userId: partnerAnswerData.user_id,
        text: partnerAnswerData.text,
        createdAt: new Date(partnerAnswerData.created_at),
      },
    };
  } catch (err) {
    return { success: false, error: 'Failed to get answers' };
  }
}
