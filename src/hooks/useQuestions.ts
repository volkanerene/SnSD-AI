import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { FRM32Question } from '@/types/api';

export function useQuestions(isActive?: boolean) {
  const queryString = isActive !== undefined ? `?is_active=${isActive}` : '';

  const {
    data: questions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['questions', isActive],
    queryFn: () =>
      apiClient.get<FRM32Question[]>(`/frm32/questions${queryString}`)
  });

  return {
    questions: questions || [],
    isLoading,
    error
  };
}

export function useQuestion(questionId: string) {
  const {
    data: question,
    isLoading,
    error
  } = useQuery({
    queryKey: ['questions', questionId],
    queryFn: () =>
      apiClient.get<FRM32Question>(`/frm32/questions/${questionId}`),
    enabled: !!questionId
  });

  return { question, isLoading, error };
}
