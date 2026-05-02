type CreateCategoryProps = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
};

export class Category {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly imageUrl: string | undefined,
  ) {}

  static create(props: CreateCategoryProps): Category {
    if (!props.id || props.id.trim().length === 0) throw new Error('Category id is required');
    if (!props.name || props.name.trim().length === 0) throw new Error('Category name is required');
    if (!props.slug || props.slug.trim().length === 0) throw new Error('Category slug is required');

    return new Category(props.id.trim(), props.name.trim(), props.slug.trim(), props.imageUrl);
  }
}
