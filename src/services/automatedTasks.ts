import prisma from '../config/prisma';
import { sendEmail } from '../utils/email';
import { UserBookType, UserBookStatus } from '../types/enums';

const BORROW_DURATION_DAYS = 3;

export async function checkAndSendReturnReminders() {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - BORROW_DURATION_DAYS);

    const overdueBorrows = await prisma.userBook.findMany({
      where: {
        type: UserBookType.BORROWED,
        status: UserBookStatus.ACTIVE,
        createdAt: {
          lte: threeDaysAgo,
        },
      },
      include: {
        book: true,
        user: true,
      },
    });

    for (const borrow of overdueBorrows) {
      await sendEmail({
        to: borrow.userId,
        subject: 'Book Return Reminder',
        text: `Dear user,\n\nThis is a reminder that you borrowed the book "${borrow.book.title}" by ${borrow.book.authors.join(', ')} on ${borrow.createdAt.toLocaleDateString()}. Please return it as soon as possible.\n\nThank you!`,
      });
    }
  } catch (error) {
    console.error('Error in checkAndSendReturnReminders:', error);
  }
} 