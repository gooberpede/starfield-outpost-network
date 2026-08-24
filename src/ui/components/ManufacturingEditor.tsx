import {
  useEffect,
  useState,
} from 'react'

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
  onQuantityCommit: (
    productId: ProductId,
    quantity: number,
  ) => void
}

export function ManufacturingEditor({
  products,
  entries,
  onAddProduct,
  onRemoveProduct,
  onQuantityCommit,
}: ManufacturingEditorProps) {
  /**
   * Holds fabricator quantities as editable text so temporary states such as an
   * empty input do not immediately affect persisted manufacturing data.
   */
  const [draftQuantities, setDraftQuantities] =
    useState<Record<string, string>>(
      Object.fromEntries(
        entries.map((entry) => [
          entry.productId,
          String(entry.quantity),
        ]),
      ),
    )

  /**
   * Keeps quantity drafts synchronized with persisted manufacturing state,
   * including product addition/removal and changes caused by Undo/Redo.
   */
  useEffect(() => {
    setDraftQuantities(
      Object.fromEntries(
        entries.map((entry) => [
          entry.productId,
          String(entry.quantity),
        ]),
      ),
    )
  }, [
    entries,
  ])

  /**
   * Updates one local fabricator-quantity draft without touching persisted
   * network state.
   */
  function updateQuantityDraft(
    productId: ProductId,
    value: string,
  ) {
    setDraftQuantities((current) => ({
      ...current,
      [productId]: value,
    }))
  }

  /**
   * Commits one valid completed fabricator-quantity edit.
   *
   * Fabricator quantities must be whole numbers of at least one. Empty or
   * otherwise invalid drafts revert to the persisted value on blur.
   */
  function commitQuantityDraft(
    productId: ProductId,
  ) {
    const entry =
      entries.find(
        (candidate) =>
          candidate.productId === productId,
      )

    if (!entry) {
      return
    }

    const draftValue =
      draftQuantities[productId] ?? ''

    if (draftValue.trim() === '') {
      setDraftQuantities((current) => ({
        ...current,
        [productId]: String(entry.quantity),
      }))

      return
    }

    const quantity =
      Number(draftValue)

    if (
      Number.isInteger(quantity) &&
      quantity >= 1
    ) {
      if (quantity !== entry.quantity) {
        onQuantityCommit(
          productId,
          quantity,
        )
      }

      return
    }

    setDraftQuantities((current) => ({
      ...current,
      [productId]: String(entry.quantity),
    }))
  }

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
                  value={
                    draftQuantities[
                      entry.productId
                    ] ?? String(entry.quantity)
                  }
                  onChange={(event) =>
                    updateQuantityDraft(
                      entry.productId,
                      event.target.value,
                    )
                  }
                  onBlur={() =>
                    commitQuantityDraft(
                      entry.productId,
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