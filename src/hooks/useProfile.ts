import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';

export function useProfile(userId: string | undefined) {
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: () => dbService.getProfile(userId!),
        enabled: !!userId,
    });
}
