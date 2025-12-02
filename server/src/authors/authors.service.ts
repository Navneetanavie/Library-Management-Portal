import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAuthorDto) {
    return this.prisma.author.create({ data });
  }

  findAll() {
    return this.prisma.author.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.author.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateAuthorDto) {
    return this.prisma.author.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.author.delete({ where: { id } });
  }
}


