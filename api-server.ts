import { query } from './src/lib/db';

// Обработчик для получения занятых слотов (GET)
export async function handleGetBookedSlots() {
  const totalSlotsRes = await query('SELECT COUNT(*) FROM time_slots');
  const totalSlotsCount = parseInt(totalSlotsRes.rows[0].count, 10);

  const fullyBookedRes = await query(`
    SELECT booking_date::text 
    FROM bookings 
    GROUP BY booking_date 
    HAVING COUNT(booking_time) >= $1
  `, [totalSlotsCount]);
  
  const fullyBookedDates = fullyBookedRes.rows.map(row => row.booking_date);

  const allBookingsRes = await query(`
    SELECT booking_date::text, booking_time::text 
    FROM bookings
  `);

  const bookedSlotsByDate: Record<string, string[]> = {};
  
  allBookingsRes.rows.forEach(row => {
    const dateStr = row.booking_date;
    const timeStr = row.booking_time.substring(0, 5); 

    if (!bookedSlotsByDate[dateStr]) {
      bookedSlotsByDate[dateStr] = [];
    }
    bookedSlotsByDate[dateStr].push(timeStr);
  });

  return { fullyBookedDates, bookedSlotsByDate };
}

// Обработчик для создания новой записи (POST)
export async function handleCreateBooking(body: any) {
  const { serviceId, bookingDate, bookingTime, phone } = body;

  if (!serviceId || !bookingDate || !bookingTime || !phone) {
    throw { status: 400, message: 'Все поля обязательны' };
  }

  try {
    await query(`
      INSERT INTO bookings (service_id, booking_date, booking_time, phone)
      VALUES ($1, $2, $3, $4)
    `, [serviceId, bookingDate, bookingTime, phone]);
    
    return { success: true, message: 'Вы успешно записаны!' };
  } catch (error: any) {
    if (error.code === '23505') {
      throw { status: 409, message: 'Это время уже занято!' };
    }
    throw { status: 500, message: 'Ошибка базы данных' };
  }
}