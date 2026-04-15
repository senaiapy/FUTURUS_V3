import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: { subCategories: true, _count: { select: { markets: true } } },
    });
  }

  async findActive() {
    return this.prisma.category.findMany({
      where: { status: 1 },
      orderBy: { name: 'asc' },
      include: { subCategories: { where: { status: 1 } } },
    });
  }

  async findById(id: number) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { subCategories: true },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(data: { name: string; slug?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug:
          data.slug ||
          data.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, ''),
        status: 1,
      },
    });
  }

  async update(id: number, data: { name?: string; slug?: string }) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async toggleStatus(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.update({
      where: { id },
      data: { status: cat.status === 1 ? 0 : 1 },
    });
  }
}
