import { DateService } from './DateService';

export class DateServiceImpl implements DateService {
  public getCurrentDate = (): Date => new Date();
}
