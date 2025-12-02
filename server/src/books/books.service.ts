import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBookDto) {
    return this.prisma.book.create({ data });
  }

  findAll(params?: { authorId?: string; isBorrowed?: boolean }) {
    const { authorId, isBorrowed } = params || {};

    return this.prisma.book.findMany({
      where: {
        authorId,
        ...(isBorrowed === true && {
          borrowRecords: {
            some: {
              returnedAt: null,
            },
          },
        }),
        ...(isBorrowed === false && {
          borrowRecords: {
            none: {
              returnedAt: null,
            },
          },
        }),
      },
      include: {
        author: true,
        borrowRecords: {
          where: { returnedAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        borrowRecords: {
          where: { returnedAt: null },
        },
      },
    });
  }

  update(id: string, data: UpdateBookDto) {
    return this.prisma.book.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.book.delete({ where: { id } });
  }
}


