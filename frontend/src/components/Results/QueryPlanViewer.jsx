import React from 'react';
import './QueryPlanViewer.scss';

const SLOW_THRESHOLD_MS = 50;

function PlanNode({ node, depth = 0 }) {
  const isSlow = node['Actual Total Time'] > SLOW_THRESHOLD_MS;

  return (
    <div className="plan-node" style={{ marginLeft: depth * 20 }}>
      <div className="plan-node__header">
        <strong>{node['Node Type']}</strong>
        {node['Relation Name'] && <span> on {node['Relation Name']}</span>}
        {isSlow && <span className="plan-node__warning"> ⚠ slow</span>}
      </div>
      <div className="plan-node__stats">
        cost: {node['Total Cost']} · actual time: {node['Actual Total Time']?.toFixed(2)}ms · rows: {node['Actual Rows']}
      </div>
      {node.Plans?.map((child, i) => (
        <PlanNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function QueryPlanViewer({ plan }) {
  if (!plan) return null;
  return (
    <div className="query-plan-viewer">
      <h4>Query Plan</h4>
      <PlanNode node={plan.Plan} />
    </div>
  );
}