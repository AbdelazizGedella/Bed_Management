  // Expand/collapse for room details
      document.querySelectorAll('.room-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
          const room = btn.getAttribute('data-room');
          const details = document.getElementById(room + '-details');
          if (details) {
            details.classList.toggle('hidden');
          }
        });
      });

      // Show case details when clicking on a patient/case name
      document.querySelectorAll('[id$="-details"] .flex').forEach(caseDiv => {
        caseDiv.style.cursor = "pointer";
        caseDiv.addEventListener('click', function(e) {
          e.stopPropagation();
          const name = caseDiv.querySelector('span:last-child').textContent;
          const ctas = name.match(/CTAS \d/);
          document.getElementById('case-details-content').innerHTML = `
            <div class="mb-2">
              <span class="font-bold">Name:</span> ${name.split(' (')[0]}
            </div>
            <div class="mb-2">
              <span class="font-bold">CTAS:</span> 
              <span class="inline-block w-3 h-3 rounded-full mr-2 align-middle" style="background:${caseDiv.querySelector('span').style.backgroundColor};"></span>
              ${ctas ? ctas[0] : 'N/A'}
            </div>
            <div>
              <span class="font-bold">Details:</span> <span class="italic text-gray-400">No further details available.</span>
            </div>
          `;
        });
      });