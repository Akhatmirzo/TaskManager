import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';

export function useTasks(projectId: string | null) {
    return useQuery({
        queryKey: ['tasks', projectId],
        queryFn: () => dbService.getTasks(projectId!),
        enabled: !!projectId,
    });
}
