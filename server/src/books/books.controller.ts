import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: CreateBookDto) {
    return this.booksService.create(body);
  }

  @Get()
  findAll(
    @Query('authorId') authorId?: string,
    @Query('isBorrowed') isBorrowedRaw?: string,
  ) {
    let isBorrowed: boolean | undefined;
    if (isBorrowedRaw === 'true') isBorrowed = true;
    if (isBorrowedRaw === 'false') isBorrowed = false;

    return this.booksService.findAll({ authorId, isBorrowed });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBookDto) {
    return this.booksService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}


