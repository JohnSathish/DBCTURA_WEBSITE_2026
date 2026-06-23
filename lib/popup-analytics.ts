export function popupAnalyticsSummary(popup: {
  totalViews: number
  totalClicks: number
  uniqueViews: number
  buttonClicks: number
  closeCount: number
}) {
  const ctr = popup.totalViews > 0 ? (popup.totalClicks / popup.totalViews) * 100 : 0
  return {
    views: popup.totalViews,
    uniqueViews: popup.uniqueViews,
    clicks: popup.totalClicks,
    buttonClicks: popup.buttonClicks,
    closeCount: popup.closeCount,
    ctr: Number(ctr.toFixed(1)),
  }
}
