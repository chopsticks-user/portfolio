import {
  component$,
  type QRL,
  type ReadonlySignal,
  type Signal,
  useSignal,
} from "@builder.io/qwik";
import { CATEGORY_LIST, type Category } from "~/lib/categories";
import { getTagColor } from "~/lib/tag-colors";
import styles from "./filter-bar.module.css";

interface FilterBarProps {
  activeCategory: Signal<Category>;
  sortOrder: Signal<string>;
  activeTags: Signal<string[]>;
  allTags: ReadonlySignal<string[]>;
  searchQuery: Signal<string>;
  onFilterChange$: QRL<() => void>;
}

export const FilterBar = component$<FilterBarProps>(
  ({
    activeCategory,
    sortOrder,
    activeTags,
    allTags,
    searchQuery,
    onFilterChange$,
  }) => {
    const panelOpen = useSignal(false);

    return (
      <div class={styles.filterSection}>
        <div class={styles.bar}>
          <div class={styles.tabs}>
            {CATEGORY_LIST.map((cat) => (
              <button
                key={cat}
                class={[
                  styles.tabBtn,
                  activeCategory.value === cat && styles.tabBtnActive,
                ]}
                onClick$={() => {
                  activeCategory.value = cat;
                  activeTags.value = [];
                  onFilterChange$();
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div class={styles.actions}>
            <button
              class={[
                styles.toggleBtn,
                panelOpen.value && styles.toggleBtnActive,
              ]}
              onClick$={() => {
                panelOpen.value = !panelOpen.value;
              }}
              aria-expanded={panelOpen.value}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
              {activeTags.value.length > 0 && (
                <span class={styles.badge}>{activeTags.value.length}</span>
              )}
              <svg
                class={[styles.chevron, panelOpen.value && styles.chevronOpen]}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <select
              class={styles.sort}
              value={sortOrder.value}
              onChange$={(_, el) => {
                sortOrder.value = el.value;
                onFilterChange$();
              }}
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="title-az">Title A–Z</option>
            </select>
          </div>
        </div>

        {(panelOpen.value || activeTags.value.length > 0) && (
          <div class={styles.panel}>
            <div class={styles.searchWrapper}>
              <svg
                class={styles.searchIcon}
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                class={styles.searchInput}
                placeholder="Search articles..."
                value={searchQuery.value}
                autoFocus
                onInput$={(_, el) => {
                  searchQuery.value = el.value;
                  onFilterChange$();
                }}
              />
            </div>
            <div class={styles.tagSection}>
              <span class={styles.tagSectionLabel}>Tags</span>
              <div class={styles.tagGrid}>
                {allTags.value.map((tag) => {
                  const isActive = activeTags.value.includes(tag);
                  const color = getTagColor(tag);
                  return (
                    <button
                      key={tag}
                      class={[
                        styles.tagOption,
                        isActive && styles.tagOptionActive,
                      ]}
                      style={{
                        color,
                        borderColor: color,
                        ...(isActive
                          ? {
                              background: `color-mix(in srgb, ${color} 15%, transparent)`,
                            }
                          : {}),
                      }}
                      onClick$={() => {
                        if (isActive) {
                          activeTags.value = activeTags.value
                            .filter((t) => t !== tag)
                            .sort();
                        } else {
                          activeTags.value = [...activeTags.value, tag].sort();
                        }
                        onFilterChange$();
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
            {activeTags.value.length > 0 && (
              <div class={styles.selectedTags}>
                {activeTags.value.map((tag) => {
                  const color = getTagColor(tag);
                  return (
                    <span
                      key={tag}
                      class={styles.selectedChip}
                      style={{ color, borderColor: color }}
                    >
                      {tag}
                      <button
                        class={styles.chipDismiss}
                        onClick$={() => {
                          activeTags.value = activeTags.value.filter(
                            (t) => t !== tag
                          );
                          onFilterChange$();
                        }}
                        aria-label={`Remove ${tag} filter`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
                <button
                  class={styles.clearAll}
                  onClick$={() => {
                    activeTags.value = [];
                    onFilterChange$();
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
