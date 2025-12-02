import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @UseGuards(JwtAuthGuard)
  @Post('borrow')
  borrow(@Body() body: BorrowBookDto) {
    return this.borrowService.borrowBook(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('borrow/:id/return')
  return(@Param('id') id: string) {
    return this.borrowService.returnBook(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/borrowed')
  listBorrowed(
    @Param('id') userId: string,
    @Query('active') active?: string,
  ) {
    const activeOnly = active === 'true';
    return this.borrowService.listBorrowedForUser(userId, activeOnly);
  }
}


