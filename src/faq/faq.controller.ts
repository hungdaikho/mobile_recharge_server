import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) {}
    @Public()
    @Get()
    async getFaq(){
        return this.faqService.getFaq()
    }
    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createFaq(@Body() dto: any){
        return this.faqService.createFaq(dto)
    }
    @UseGuards(JwtAuthGuard)
    @Post('update')
    async update(@Body() dto: any){
        return this.faqService.createFaq(dto)
    }
    @UseGuards(JwtAuthGuard)
    @Post('delete')
    async deleteFaq(@Body() id: any){
        return this.faqService.deleteFaq(id)
    }
}
