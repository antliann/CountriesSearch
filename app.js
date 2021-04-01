const appRoot = document.getElementById('app-root');

appRoot.innerHTML = `<header><h1>Countries Search</h1></header>
    <form>
        <div id="search-type-field">
            <label>Please, choose type of search:</label><br>
            <input type="radio" id="region" name="search-type" onclick="changeSearchType('region')">
            <label for="region" class="search-option">By Region</label><br>
            <input type="radio" id="lang" name="search-type" onclick="changeSearchType('lang')">
            <label for="lang" class="search-option">By Language</label>
        </div>
        <div id="query-field">
            <label for="query">Please, choose search query:</label><br>
            <select id="query-list" disabled>
                <option selected disabled>Select value</option>
            </select>
        </div>
    </form>
    <div id="results"></div>`;

const tableStatus = {
    resultsList: [],
    sort: {
        name: false,
        area: false,
    },
    sortIsAscending: true,
}

function changeSearchType(searchType) {
    makeQueryDropdownList(searchType);
    document.getElementById('query-list').disabled = false;
    document.getElementById('query-list').onchange = () => search(searchType);
    document.getElementById('results').innerHTML = '<p>No items, please choose search query</p>';
}

function makeQueryDropdownList(searchType) {
    let options = '<option selected disabled>Select value</option>';

    const queryList = searchType === 'region' ?
        externalService.getRegionsList() :
        externalService.getLanguagesList();
    for (const query of queryList) {
        options += `<option value="${query}">${query}</option>`;
    }

    document.getElementById('query-list').innerHTML = options;
}

function search(searchType) {
    const queryList = document.getElementById('query-list');
    const query = queryList.options[queryList.selectedIndex].value;

    Object.assign(tableStatus, {
        resultsList: searchType === 'region' ?
            externalService.getCountryListByRegion(query) :
            externalService.getCountryListByLanguage(query),
        sort: {
            name: false,
            area: false,
        },
        sortIsAscending: true,
    });
    buildTable();
}

function buildTable() {
    const sortOrder = tableStatus.sortIsAscending ? '&#129045;' : '&#129047;';
    const tableHeader = `<tr>
        <th>Country Name <span onclick="sortBy('name')">${tableStatus.sort.name ? sortOrder : '&#11021;'}</span></th>
        <th>Capital</th>
        <th>World Region</th>
        <th>Languages</th>
        <th>Area <span onclick="sortBy('area')">${tableStatus.sort.area ? sortOrder : '&#11021;'}</span></th>
        <th>Flag</th></tr>`;

    document.getElementById('results').innerHTML = `<table>${tableHeader}${buildCountriesRows()}</table>`;
}

function buildCountriesRows() {
    let countriesRows = '';
    for (const result of tableStatus.resultsList) {
        let countryLanguages = [];
        for (const lang in result.languages) {
            if (result.languages.hasOwnProperty(lang)) {
                countryLanguages.push(result.languages[lang]);
            }
        }
        countriesRows += `<tr>
            <td>${result.name}</td>
            <td>${result.capital}</td>
            <td>${result.region}</td>
            <td>${countryLanguages.join(', ')}</td>
            <td>${result.area}</td>
            <td><img src="${result.flagURL}" alt="${result.name} flag"></td>
            </tr>`;
    }
    return countriesRows;
}

function sortBy(parameter) {
    if (tableStatus.sort[parameter]) {
        tableStatus.sortIsAscending = !tableStatus.sortIsAscending;
    } else {
        tableStatus.sort[parameter === 'name' ? 'area' : 'name'] = false;
        tableStatus.sort[parameter] = true;
        tableStatus.sortIsAscending = true;
    }
    tableStatus.resultsList.sort(function (a, b) {
        if (a[parameter] < b[parameter]) {
            return tableStatus.sortIsAscending ? -1 : 1;
        }
        if (a[parameter] > b[parameter]) {
            return tableStatus.sortIsAscending ? 1 : -1;
        }
        return 0;
    });
    buildTable();
}
