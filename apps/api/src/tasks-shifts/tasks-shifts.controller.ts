import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateShiftDto, CreateTaskDto, UpdateShiftStatusDto, UpdateTaskStatusDto } from './dto';
import { TasksShiftsService } from './tasks-shifts.service';
@ApiTags('tasks and shifts') @Controller()
export class TasksShiftsController {
  constructor(private readonly service:TasksShiftsService){}
  @Get('tasks') tasks(){return this.service.tasks()} @Post('tasks') createTask(@Body()dto:CreateTaskDto){return this.service.createTask(dto)}
  @Patch('tasks/:id/status') taskStatus(@Param('id')id:string,@Body()dto:UpdateTaskStatusDto){return this.service.taskStatus(id,dto.status)}
  @Get('shifts') shifts(@Query('date')date?:string){return this.service.shifts(date)} @Post('shifts') createShift(@Body()dto:CreateShiftDto){return this.service.createShift(dto)}
  @Patch('shifts/:id/status') shiftStatus(@Param('id')id:string,@Body()dto:UpdateShiftStatusDto){return this.service.shiftStatus(id,dto.status)}
}
