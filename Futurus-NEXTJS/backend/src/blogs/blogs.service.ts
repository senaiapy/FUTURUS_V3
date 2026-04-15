import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  // Public: Get all published blogs
  async findAll() {
    return this.prisma.blog.findMany({
      where: { status: 1 },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Public: Get blog by slug
  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
    });

    if (!blog || blog.status !== 1) {
      throw new NotFoundException('Blog not found');
    }

    // Increment views
    await this.prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    });

    return blog;
  }

  // Admin: Get all blogs (including drafts)
  async findAllAdmin() {
    return this.prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin: Get blog by ID
  async findById(id: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  // Admin: Create blog
  async create(data: {
    title: string;
    slug?: string;
    description?: string;
    content?: string;
    image?: string;
    category?: string;
    author?: string;
    status?: number;
  }) {
    // Generate slug from title if not provided
    const slug = data.slug || this.generateSlug(data.title);

    return this.prisma.blog.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        content: data.content,
        image: data.image,
        category: data.category || 'Geral',
        author: data.author || 'Admin',
        status: data.status ?? 1,
      },
    });
  }

  // Admin: Update blog
  async update(
    id: number,
    data: {
      title?: string;
      slug?: string;
      description?: string;
      content?: string;
      image?: string;
      category?: string;
      author?: string;
      status?: number;
    },
  ) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // If title changed and no slug provided, regenerate slug
    let slug = data.slug;
    if (data.title && data.title !== blog.title && !data.slug) {
      slug = this.generateSlug(data.title);
    }

    return this.prisma.blog.update({
      where: { id },
      data: {
        ...data,
        slug: slug || undefined,
      },
    });
  }

  // Admin: Delete blog
  async delete(id: number) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.prisma.blog.delete({ where: { id } });
  }

  // Admin: Toggle status
  async toggleStatus(id: number) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.prisma.blog.update({
      where: { id },
      data: { status: blog.status === 1 ? 0 : 1 },
    });
  }

  // Helper: Generate slug from title
  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple hyphens
        .replace(/^-|-$/g, '') // Trim hyphens
        .substring(0, 200) + // Limit length
      '-' +
      Date.now().toString(36)
    ); // Add unique suffix
  }
}
