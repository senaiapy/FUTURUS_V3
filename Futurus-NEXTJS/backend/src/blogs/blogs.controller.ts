import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BlogsService } from './blogs.service';
import { AdminGuard } from '../admin/admin.guard';
import { Public } from '../admin/public.decorator';

@Controller()
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  // ========== PUBLIC ROUTES ==========

  @Public()
  @Get('blogs')
  async findAll() {
    return this.blogsService.findAll();
  }

  @Public()
  @Get('blogs/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }

  // ========== ADMIN ROUTES ==========

  @UseGuards(AdminGuard)
  @Get('admin/blogs')
  async findAllAdmin() {
    return this.blogsService.findAllAdmin();
  }

  @UseGuards(AdminGuard)
  @Get('admin/blogs/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.blogsService.findById(id);
  }

  @UseGuards(AdminGuard)
  @Post('admin/blogs')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/blogs',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `blog-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(
    @Body()
    body: {
      title: string;
      slug?: string;
      description?: string;
      content?: string;
      category?: string;
      author?: string;
      status?: string;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const image = file ? `/uploads/blogs/${file.filename}` : undefined;
    return this.blogsService.create({
      ...body,
      image,
      status: body.status ? parseInt(body.status) : 1,
    });
  }

  @UseGuards(AdminGuard)
  @Put('admin/blogs/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/blogs',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `blog-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      slug?: string;
      description?: string;
      content?: string;
      category?: string;
      author?: string;
      status?: string;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const image = file ? `/uploads/blogs/${file.filename}` : undefined;
    return this.blogsService.update(id, {
      ...body,
      image,
      status: body.status !== undefined ? parseInt(body.status) : undefined,
    });
  }

  @UseGuards(AdminGuard)
  @Delete('admin/blogs/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.blogsService.delete(id);
  }

  @UseGuards(AdminGuard)
  @Post('admin/blogs/:id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.blogsService.toggleStatus(id);
  }
}
