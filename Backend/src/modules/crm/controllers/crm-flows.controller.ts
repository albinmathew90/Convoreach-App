import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/auth.decorators';
import { CrmFlowsService, CreateFlowDto } from '../services/crm-flows.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Public()
@ApiTags('crm-flows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/flows')
export class CrmFlowsController {
  constructor(private readonly crmFlowsService: CrmFlowsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateFlowDto) {
    return this.crmFlowsService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.crmFlowsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const flow = await this.crmFlowsService.findOne(req.user.id, id);
    if (!flow) throw new NotFoundException('Flow not found');
    return flow;
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: CreateFlowDto) {
    const flow = await this.crmFlowsService.update(req.user.id, id, dto);
    if (!flow) throw new NotFoundException('Flow not found');
    return flow;
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.crmFlowsService.remove(req.user.id, id);
    return { success: true };
  }

  @Post(':id/enable')
  async enable(@Req() req: any, @Param('id') id: string) {
    const flow = await this.crmFlowsService.setEnabled(req.user.id, id, true);
    if (!flow) throw new NotFoundException('Flow not found');
    return flow;
  }

  @Post(':id/disable')
  async disable(@Req() req: any, @Param('id') id: string) {
    const flow = await this.crmFlowsService.setEnabled(req.user.id, id, false);
    if (!flow) throw new NotFoundException('Flow not found');
    return flow;
  }
}
