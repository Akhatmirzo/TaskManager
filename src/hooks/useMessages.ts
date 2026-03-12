import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';
import { Message } from '../types';

export function useMessages(projectId: string | null) {
    return useQuery<Message[]>({
        queryKey: ['messages', projectId],
        queryFn: () => projectId ? dbService.getMessages(projectId) : Promise.resolve([]),
        enabled: !!projectId,
    });
}
