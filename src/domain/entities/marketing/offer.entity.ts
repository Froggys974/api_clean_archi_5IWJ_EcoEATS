type CreateOfferProps = {
  id: string;
  restaurantId: string;
  label: string;
  discountPercent: number;
  imageUrl?: string;
};

export class Offer {
  private constructor(
    public readonly id: string,
    public readonly restaurantId: string,
    public readonly label: string,
    public readonly discountPercent: number,
    public readonly imageUrl: string | undefined,
  ) {}

  static create(props: CreateOfferProps): Offer {
    if (!props.id || props.id.trim().length === 0) throw new Error('Offer id is required');
    if (!props.restaurantId || props.restaurantId.trim().length === 0) throw new Error('Restaurant id is required');
    if (!props.label || props.label.trim().length === 0) throw new Error('Offer label is required');
    if (!Number.isFinite(props.discountPercent) || props.discountPercent < 0 || props.discountPercent > 100) throw new Error('Discount percent must be between 0 and 100');

    return new Offer(props.id, props.restaurantId, props.label, props.discountPercent, props.imageUrl);
  }
}
