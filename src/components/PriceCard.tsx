interface PriceCardProps {
  itemName: string;
  category: string;
  suggestedPrice: number;
  emoji?: string;
  imageUrl?: string;
}

export function PriceCard({
  itemName,
  category,
  suggestedPrice,
  emoji,
  imageUrl,
}: PriceCardProps) {
  return (
    <div className="pw-card min-w-[160px] snap-start shrink-0 cursor-pointer hover:-translate-y-1 transition-transform duration-200">
      {/* Image / Emoji Fallback */}
      <div className="relative aspect-square w-full overflow-hidden rounded-card mb-3 bg-pricewise-cream dark:bg-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-pricewise-grey">
            <span className="text-4xl">{emoji || '🏷️'}</span>
          </div>
        )}
      </div>

      {/* Category Tag */}
      <span className="pw-tag mb-2">{category}</span>

      {/* Item Name */}
      <h3 className="text-base font-semibold text-pricewise-charcoal dark:text-white mb-1 truncate">
        {itemName}
      </h3>

      {/* Suggested Price */}
      <p className="text-pricewise-green font-medium text-lg mb-3">
        ${suggestedPrice.toFixed(2)}
      </p>

      {/* CTA */}
      <button className="pw-btn w-full text-xs py-2 px-2 shadow-sm">
        View Listing
      </button>
    </div>
  );
}
