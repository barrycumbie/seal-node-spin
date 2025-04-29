// Fetch the JSON data

fetch('data/parkingData')
// fetch('https://barrycumbie.github.io/jubilant-garbanzo-easy-read/data/parkingData.json')

// {
//     mode: 'cors',
//     headers: {
//       'Access-Control-Allow-Origin':'*'
//     }
//   }
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(data => {
        //use to check data object returned okay
        // console.log("data", data);
        displayParkingData(data);
    })
    .catch(error => {
        // Handle errors
        console.error('Fetch Error :-S', error);
    });


function displayParkingData(parkingData) {
    const dataSpot = document.getElementById('dataSpot');
    dataSpot.innerHTML = ''; // Clear existing list items

    for (const log of parkingData) {
        // Convert date to Central Time Zone
        const centralTime = new Date(log.date).toLocaleString('en-US', { timeZone: 'America/Chicago' });

        // Create a list item
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
            <strong>${centralTime}: </strong><span class="note-text">${log.note}</span>
            <input type="hidden" name="parkingId" value="${log._id}">
        `;

        // Add a click event listener to enter edit mode
        listItem.addEventListener('click', () => {
            enterEditMode(listItem, log._id, log.note);
        });

        // Append the list item to the dataSpot element
        dataSpot.appendChild(listItem);
    }
}

// Function to enter edit mode
function enterEditMode(listItem, id, noteTextContent) {
    const noteText = listItem.querySelector('.note-text');
    if (!noteText) {
        console.error('Error: note-text element not found in the list item.');
        return;
    }

    // Replace the note text with an input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = noteTextContent;
    input.className = 'form-control form-control-sm';
    noteText.replaceWith(input);

    // Clear existing buttons
    listItem.querySelectorAll('button').forEach(button => button.remove());

    // Create Save button
    const saveButton = document.createElement('button');
    saveButton.className = 'btn btn-sm btn-outline-success save-btn';
    saveButton.innerHTML = `<i class="bi bi-check"></i> Save`;
    saveButton.addEventListener('click', () => saveParkingLog(listItem, id, input.value));

    // Create Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-sm btn-outline-secondary cancel-btn';
    cancelButton.innerHTML = `<i class="bi bi-x"></i> Cancel`;
    cancelButton.addEventListener('click', () => cancelEditMode(listItem, noteTextContent));

    // Create Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-sm btn-outline-danger delete-btn';
    deleteButton.innerHTML = `<i class="bi bi-trash"></i> Delete`;
    deleteButton.addEventListener('click', () => deleteParkingLog(id));

    // Append buttons to the list item
    listItem.appendChild(saveButton);
    listItem.appendChild(cancelButton);
    listItem.appendChild(deleteButton);
}

// Function to save a parking log
function saveParkingLog(listItem, id, updatedNote) {
    // Update the note in the database
    fetch(`/updateParkingData/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: updatedNote }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Updated parking log:', data);

            // Replace input with updated note text
            const span = document.createElement('span');
            span.className = 'note-text';
            span.textContent = updatedNote;
            const input = listItem.querySelector('input[type="text"]');
            input.replaceWith(span);

            // Clear buttons and reset to default state
            listItem.querySelectorAll('button').forEach(button => button.remove());
        })
        .catch(error => console.error('Error updating parking log:', error));
}

// Function to edit a parking log
function editParkingLog(listItem, id, noteTextContent) {
    console.log(`listItem`, listItem);
    console.log('id', id);
    console.log('noteTextContent', noteTextContent);

    const editButton = listItem.querySelector('.edit-btn'); // Select the button itself
    const editIcon = editButton.querySelector('i'); // Select the icon inside the button

    if (editIcon.classList.contains('bi-pencil')) {
        // Change to edit mode
        const input = document.createElement('input');
        input.type = 'text';
        input.value = noteTextContent; // Use the passed noteTextContent
        input.className = 'form-control form-control-sm';

        const noteText = listItem.querySelector('.note-text');
        if (noteText) {
            noteText.replaceWith(input); // Replace the note text with the input field
        } else {
            console.error('Error: note-text element not found in the list item.');
            return;
        }

        // Update button to "Save" mode
        console.log('Before:', editIcon.classList);
        editIcon.classList.remove('bi-pencil');
        editIcon.classList.add('bi-check'); // Change icon to a checkmark
        console.log('After:', editIcon.classList);

        // Update button text and ensure icon is visible
        editButton.innerHTML = `<i class="bi bi-check"></i> Save`;
    } else {
        // Save the edited note
        const input = listItem.querySelector('input[type="text"]');
        if (!input) {
            console.error('Error: input element not found in the list item.');
            return;
        }
        const updatedNote = input.value;

        // Update the note in the database
        fetch(`/updateParkingData/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: updatedNote }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Updated parking log:', data);

                // Replace input with updated note text
                const span = document.createElement('span');
                span.className = 'note-text';
                span.textContent = updatedNote;
                input.replaceWith(span);

                // Update button back to "Edit" mode
                editIcon.classList.remove('bi-check');
                editIcon.classList.add('bi-pencil'); // Change icon back to a pencil
                editButton.innerHTML = `<i class="bi bi-pencil"></i> Edit`;
            })
            .catch(error => console.error('Error updating parking log:', error));
    }
}

// Function to delete a parking log
function deleteParkingLog(id) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this parking log?')) return;

    // Delete the note from the database (mocked here)
    fetch(`/deleteParkingData/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            console.log('Deleted parking log:', data);
            // Reload the parking data
            fetch('data/parkingData')
                .then(response => response.json())
                .then(displayParkingData)
                .catch(error => console.error('Error reloading parking data:', error));
        })
        .catch(error => console.error('Error deleting parking log:', error));
}

// Function to cancel edit mode
function cancelEditMode(listItem, originalNote) {
    const input = listItem.querySelector('input[type="text"]');
    if (!input) {
        console.error('Error: input element not found in the list item.');
        return;
    }

    // Replace input with the original note text
    const span = document.createElement('span');
    span.className = 'note-text';
    span.textContent = originalNote;
    input.replaceWith(span);

    // Clear buttons and reset to default state
    listItem.querySelectorAll('button').forEach(button => button.remove());
}