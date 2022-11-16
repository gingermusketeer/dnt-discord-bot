import { object, date, ValidationError } from 'yup';
import { startOfDay, addDays } from 'date-fns';

export type BookingDates = { checkIn: Date; checkOut: Date };

export class BookingDatesSchema {
  private schema;

  constructor() {
    this.schema = object({
      checkIn: date()
        .required('Check-in is required')
        .min(startOfDay(new Date()), 'Check-in cannot be in the past'),
      checkOut: date()
        .when('checkIn', (checkIn, schema) => {
          if (checkIn) {
            return schema.min(
              addDays(checkIn, 1),
              'Check-out must be after check-in',
            );
          } else {
            return schema;
          }
        })
        .required('Check-out is required'),
    });
  }

  public async validate(
    checkIn: string | null,
    checkOut: string | null,
  ): Promise<BookingDates | undefined> {
    const data = {
      checkIn: checkIn,
      checkOut: checkOut,
    };

    try {
      return await this.schema.validate(data, {
        abortEarly: false,
      });
    } catch (e) {
      if (e instanceof ValidationError || e instanceof TypeError) {
        console.log(
          `timestamp=${Date.now().toString()}`,
          'origin="booking date validation"',
          `message="${e.message}"`,
        );
        return;
      }
      throw e;
    }
  }
}
