import { Args, Query, Resolver } from "@nestjs/graphql";
import { CategoryService } from "./category.service";
import { CategoryModel } from "./models/category.model";
import { CategoryFiltersInput } from "./inputs/category-filter.input";

@Resolver('Category')
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => [CategoryModel], { name: 'findAllCategories' })
  public async findAll(@Args('data') input: CategoryFiltersInput){
    return this.categoryService.findAll(input);
  }

  @Query(() => CategoryModel, { name: 'findCategorieBySlug' })
  public async findBySlug(@Args('slug') slug: string){
    return this.categoryService.findBySlug(slug);
  }
}