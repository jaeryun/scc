import type { Metadata } from 'next';
import ApiReferenceViewer from './api-reference-viewer';

export const metadata: Metadata = {
  title: 'API Reference',
  description: 'SCC production API documentation'
};

export default function ApiReferencePage() {
  return <ApiReferenceViewer />;
}
