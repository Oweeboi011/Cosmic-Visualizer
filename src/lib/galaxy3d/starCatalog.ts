/**
 * Maps generated "clickable star" indices to NASA Image Library search terms and
 * display labels. Terms/labels are illustrative — the 3D positions are not real star
 * coordinates, only the linked NASA imagery/data is real.
 */

const SEARCH_TERMS = [
  "spiral galaxy",
  "nebula",
  "star cluster",
  "supernova remnant",
  "globular cluster",
  "Milky Way core",
  "black hole",
  "star formation",
] as const;

export interface StarCatalogEntry {
  id: number;
  label: string;
  searchTerm: string;
}

export function getStarCatalogEntry(index: number): StarCatalogEntry {
  const searchTerm = SEARCH_TERMS[index % SEARCH_TERMS.length];
  const groupLetter = String.fromCharCode(65 + (index % 26));
  return {
    id: index,
    label: `Star Cluster ${groupLetter}-${index}`,
    searchTerm,
  };
}
