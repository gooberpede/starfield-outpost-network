import type {
  ManufacturingEntry,
  Product,
} from '../../domain/models'

import type {
  ProductId,
} from '../../domain/referenceData'

interface ManufacturingEditorProps {
  products: Product[]
  entries: ManufacturingEntry[]
  onAddProduct: (productId: ProductId) => void
  onRemoveProduct: (productId: ProductId) => void
  onQuantityChange: (
    productId: ProductId,
    quantity: number,
  ) => void
}

export function ManufacturingEditor({
  products,
  entries,
  onAddProduct,
  onRemoveProduct,
  onQuantityChange,
}: ManufacturingEditorProps) {
  function addProduct(productId: ProductId) {
    if (!productId) {
      return
    }

    const alreadyExists = entries.some(
      (entry) =>
        entry.productId === productId,
    )

    if (alreadyExists) {
      return
    }

    onAddProduct(productId)
  }

  function updateQuantity(
    productId: ProductId,
    quantity: number,
  ) {
    onQuantityChange(
      productId,
      quantity,
    )
  }

  function removeProduct(
    productId: ProductId,
  ) {
    onRemoveProduct(productId)
  }

  return (
    <section>
      <h2>Manufacturing</h2>

      {entries.length === 0 ? (
        <p>No manufacturing recorded.</p>
      ) : (
        entries.map((entry) => {
          const product = products.find(
            (candidate) => candidate.id === entry.productId,
          )

          return (
            <p key={entry.productId}>
              <strong>
                {product?.name ?? entry.productId}
              </strong>

              {' — '}

              <label>
                Fabricators:
                <input
                  type="number"
                  min="1"
                  value={entry.quantity}
                  onChange={(event) =>
                    updateQuantity(
                      entry.productId,
                      Number(event.target.value),
                    )
                  }
                />
              </label>

              {' '}

              <button
                type="button"
                onClick={() => removeProduct(entry.productId)}
              >
                Remove
              </button>
            </p>
          )
        })
      )}

      <p>
        <label>
          Add product:
          <select
            defaultValue=""
            onChange={(event) => {
              addProduct(event.target.value)
              event.target.value = ''
            }}
          >
            <option value="">Select product...</option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
                disabled={entries.some(
                  (entry) => entry.productId === product.id,
                )}
              >
                {product.name}
              </option>
            ))}
          </select>
        </label>
      </p>
    </section>
  )
}