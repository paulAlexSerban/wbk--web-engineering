import React from "react";

interface TabGroupProps {
  tabs: string[];
  children: React.ReactNode;
}

/**
 * CSS-only tabs — no client hydration required, works with global MDX injection.
 */
export const TabGroup: React.FC<TabGroupProps> = ({ tabs, children }) => {
  const panels = React.Children.toArray(children);
  const groupId = React.useId().replace(/:/g, "");

  return (
    <div className="tab-group">
      <div className="tab-list" role="tablist">
        {tabs.map((tab, i) => {
          const inputId = `tab-${groupId}-${i}`;
          return (
            <React.Fragment key={tab}>
              <input
                type="radio"
                name={`tab-group-${groupId}`}
                id={inputId}
                className="tab-input"
                defaultChecked={i === 0}
              />
              <label htmlFor={inputId} className="tab-label" role="tab">
                {tab}
              </label>
            </React.Fragment>
          );
        })}
      </div>
      <div className="tab-panels">
        {panels.map((panel, i) => (
          <div
            key={i}
            className="tab-panel"
            role="tabpanel"
            data-tab-index={i}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabGroup;
