import { useEffect, useRef } from 'react'
import { useLocalization } from '../../localization/LocalizationContext'
import type { ReferenceFailure, ReferenceFailureCode } from '../../data/referenceDataLoader'
import type { MessageKey } from '../../localization/types'
import './ReferenceFatalState.css'

const reasonKeys: Record<ReferenceFailureCode, MessageKey> = {
  REF_MANIFEST_FETCH: 'referenceFatal.reason.manifestFetch',
  REF_MANIFEST_INVALID: 'referenceFatal.reason.manifestInvalid',
  REF_MANIFEST_VERSION: 'referenceFatal.reason.manifestVersion',
  REF_BUILD_MISMATCH: 'referenceFatal.reason.buildMismatch',
  REF_ASSET_FETCH: 'referenceFatal.reason.assetFetch',
  REF_ASSET_CONTENT_TYPE: 'referenceFatal.reason.assetContentType',
  REF_ASSET_JSON: 'referenceFatal.reason.assetJson',
  REF_ASSET_SCHEMA: 'referenceFatal.reason.assetSchema',
  REF_ASSET_SIZE: 'referenceFatal.reason.assetSize',
  REF_ASSET_HASH: 'referenceFatal.reason.assetHash',
  REF_LOADER_INTERNAL: 'referenceFatal.reason.internal',
}

export function ReferenceFatalState({ failure, onReload }: { failure: ReferenceFailure; onReload: () => void }) {
  const { locale, t } = useLocalization()
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])
  // Only typed fields populated by the loader enter this report. No browser storage,
  // location, response body, exception, or user-created label is read here.
  const diagnostics = [
    [t('referenceFatal.diagnostic.code'), failure.code],
    [t('referenceFatal.diagnostic.asset'), failure.asset],
    [t('referenceFatal.diagnostic.status'), failure.status],
    [t('referenceFatal.diagnostic.mediaType'), failure.mediaType],
    [t('referenceFatal.diagnostic.schemaVersion'), failure.schemaVersion],
    [t('referenceFatal.diagnostic.expectedDataset'), failure.expectedDatasetId],
    [t('referenceFatal.diagnostic.actualDataset'), failure.actualDatasetId],
    [t('referenceFatal.diagnostic.expectedHash'), failure.expectedHashPrefix],
    [t('referenceFatal.diagnostic.actualHash'), failure.actualHashPrefix],
    [t('referenceFatal.diagnostic.locale'), locale],
  ].filter((entry) => entry[1] !== undefined)
  const reportBody = [t('referenceFatal.report.body'), '', ...diagnostics.map(([label, value]) => `${label}: ${value}`)].join('\n')
  const reportHref = `mailto:support@starfieldoutposts.com?subject=${encodeURIComponent(t('referenceFatal.report.subject'))}&body=${encodeURIComponent(reportBody)}`
  return <main className="reference-fatal">
    <section className="reference-fatal__panel" aria-labelledby="reference-fatal-heading">
      <h1 id="reference-fatal-heading" ref={headingRef} tabIndex={-1}>{t('referenceFatal.heading')}</h1>
      <p>{t('referenceFatal.explanation')}</p>
      <p>{t(reasonKeys[failure.code])}</p>
      <dl className="reference-fatal__diagnostics">
        {diagnostics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      <div className="reference-fatal__actions">
        <button type="button" onClick={onReload}>{t('referenceFatal.reload')}</button>
        <a href={reportHref}>{t('referenceFatal.report')}</a>
      </div>
      <p className="reference-fatal__privacy">{t('referenceFatal.privacy')}</p>
    </section>
  </main>
}
