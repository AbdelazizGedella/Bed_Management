function showDetails(area) {
  document.getElementById('details-box').classList.remove('hidden');
  
  if (area === 'acute1') {
    document.getElementById('details-title').innerText = "Acute Care Area 1";
    document.getElementById('details-content').innerText = "Contains: Triage Room, Ex.1, Ex.2, Pediatric Area (3 Beds).";
  } else if (area === 'acute2') {
    document.getElementById('details-title').innerText = "Acute Care Area 2";
    document.getElementById('details-content').innerText = "Contains: Ex.4, Ex.5, Ex.6, Ex.7, Trauma Area (3 Beds).";
  } else if (area === 'fastTrack') {
    document.getElementById('details-title').innerText = "Fast Track Area";
    document.getElementById('details-content').innerText = "Contains: 5 Chairs for quick assessments.";
  }
}

function closeDetails() {
  document.getElementById('details-box').classList.add('hidden');
}
