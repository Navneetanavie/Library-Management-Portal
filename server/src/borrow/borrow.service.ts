import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BorrowBookDto } from './dto/borrow-book.dto';

@Injectable()
export class BorrowService {
  constructor(private readonly prisma: PrismaService) {}

  async borrowBook(data: BorrowBookDto) {
    const book = await this.prisma.book.findUnique({
      where: { id: data.bookId },
      include: { borrowRecords: { where: { returnedAt: null } } },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.borrowRecords.length > 0) {
      throw new BadRequestException('Book is already borrowed');
    }

    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.borrowRecord.create({
      data: {
        userId: data.userId,
        bookId: data.bookId,
      },
    });
  }

  async returnBook(borrowId: string) {
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id: borrowId },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    if (record.returnedAt) {
      throw new BadRequestException('Book already returned');
    }

    return this.prisma.borrowRecord.update({
      where: { id: borrowId },
      data: { returnedAt: new Date() },
    });
  }

  async listBorrowedForUser(userId: string, activeOnly?: boolean) {
    return this.prisma.borrowRecord.findMany({
      where: {
        userId,
        ...(activeOnly === true && { returnedAt: null }),
      },
      include: {
        book: {
          include: {
            author: true,
          },
        },
      },
      orderBy: { borrowedAt: 'desc' },
    });
  }
}


