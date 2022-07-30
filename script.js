let windowUrl = null;
let currentNotesId = null;
let search_key = "";

const DATA_KEY = "stored_linkedin_profiles";
const VISIBLE = 'visible';
const HIDDEN = 'hidden';
const NONE = 'NONE';

const ADD_BUTTON_ID = "add-button"
const DELETE_BUTTON_ID = "-delete-button";
const NOTES_BUTTON_ID = "-notes-button";

function setData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function removeObjectById(id, list) {
    const result = list.filter(function (obj) {
        return obj.id !== id;
    });
    return result;
}

function getDateString() {
    var today = new Date();
    return today.toLocaleString();
}

chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
    function (tabs) {
        if (tabs[0].url.includes("www.linkedin.com/in/")) {
            windowUrl = tabs[0].url;
        } else {
            windowUrl = null;
        }
        document.getElementById("update-section").style.visibility = HIDDEN;
        udpateTableContent();
    }
);

function udpateTableContent() {
    const list = localStorage.getItem(DATA_KEY);
    if (list) {
        let parsedList = JSON.parse(list);
        if (search_key.length > 0) {
            parsedList = parsedList.filter(function (obj) {
                return obj.id.includes(search_key) || obj.notes.includes(search_key)
            })
        }
        let tableData = '';
        for (i = parsedList.length - 1; i >= 0; i--) {
            tableData = tableData + `
                <tr>
                    <td><a href="${parsedList[i].url}" target="_blank" id="${parsedList[i].id}">${parsedList[i].id}</a></td>
                    <td><button id="${parsedList[i].id}${NOTES_BUTTON_ID}" type="button" class="btn btn-secondary btn-sm"><i id="${parsedList[i].id}${NOTES_BUTTON_ID}-icon" class="fa fa-sticky-note"></i></button></td>
                    <td>${parsedList[i].last_updated}</td>
                    <td><button id="${parsedList[i].id}${DELETE_BUTTON_ID}" type="button" class="btn btn-danger btn-sm"><i  id="${parsedList[i].id}${DELETE_BUTTON_ID}-icon" class="fa fa-trash"></i></button></td>
                </tr>
            `;
        }
        document.getElementById("table-body").innerHTML = tableData;
    }
}

document.getElementById(ADD_BUTTON_ID).addEventListener("click", function (e) {
    if (windowUrl) {
        const list = localStorage.getItem(DATA_KEY);
        if (list) {
            const id = windowUrl.split("/")[4];
            let parsedList = JSON.parse(list);
            if (parsedList.find(x => x.id == id)) {
                return;
            }
            parsedList.push({
                url: windowUrl,
                notes: "",
                id: id,
                last_updated: getDateString()
            })
            setData(parsedList)
        } else {
            setData([
                {
                    url: windowUrl,
                    id: id,
                    notes: "",
                    last_updated: getDateString()
                }
            ])
        }
    } else {
        alert("Please go to a valid linkedin profile")
    }
    udpateTableContent();
});


document.addEventListener("click", function (e) {
    if (e.target && e.target.id.includes(DELETE_BUTTON_ID)) {
        const confirm_check = confirm("Are you sure you want to delete? This action is irreversable")
        if (confirm_check) {
            const id = e.target.id.split(DELETE_BUTTON_ID)[0];
            const list = localStorage.getItem(DATA_KEY);
            if (list) {
                let parsedList = JSON.parse(list);
                parsedList = removeObjectById(id, parsedList);
                setData(parsedList);
                udpateTableContent();
            }
        }
    }
    if (e.target && e.target.id.includes(NOTES_BUTTON_ID)) {
        const id = e.target.id.split(NOTES_BUTTON_ID)[0];
        const list = localStorage.getItem(DATA_KEY);
        if (list) {
            let parsedList = JSON.parse(list);
            const found = parsedList.find(x => x.id == id);
            document.getElementById("update-section").style.visibility = VISIBLE;
            if (found) {
                currentNotesId = id;
                document.getElementById("update-id").innerHTML = `Update ${id} Notes`;
                document.getElementById("notes-input").value = found.notes;
            }
        }
    }
})


document.getElementById("save-notes").addEventListener("click", function (e) {
    const list = localStorage.getItem(DATA_KEY);
    if (list) {
        let parsedList = JSON.parse(list);
        const found = parsedList.find(x => x.id == currentNotesId);
        if (found) {
            found.notes = document.getElementById("notes-input").value;
            found.last_updated = getDateString();
            parsedList = removeObjectById(currentNotesId, parsedList);
            parsedList.push(found);
            setData(parsedList);
            udpateTableContent();
            document.getElementById("update-section").style.visibility = HIDDEN;
        }
    }
});

document.getElementById("search-bar").addEventListener('change', function (e) {
    if (e.target && e.target.value) {
        search_key = e.target.value;
        udpateTableContent();
    } else {
        search_key = "";
        udpateTableContent();
    }
})
