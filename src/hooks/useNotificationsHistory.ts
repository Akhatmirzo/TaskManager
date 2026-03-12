import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/dbService';

export function useNotificationsHistory() {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: () => dbService.getNotifications(),
    });
}
