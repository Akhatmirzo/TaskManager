import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: () => dbService.getProjects(),
    });
}
