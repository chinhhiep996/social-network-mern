function create(user) {
    return fetch('/api/users', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then((response) => {
        return response.json()
    })
    .catch((err) => console.log(err));
}

function list() {
    return fetch('/api/users', {
        method: 'GET'
    })
    .then((response) => {
        return response.json();
    })
    .catch((err) => console.log(err));
}

function read(params, credentials) {
    return fetch(`/api/users/${params.userId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    })
    .then((response) => {
        return response.json();
    })
    .catch((err) => console.log(err));
}

function update(params, credentials, user) {
    return fetch(`/api/users/${params.userId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + credentials.t
        },
        body: user
    })
    .then((response) => {
        return response.json();
    }).catch((err) => console.log(err));
}

function remove(params, credentials) {
    return fetch(`/api/users/${params.userId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    })
    .then((response) => {
        return response.json();
    }).catch((err) => console.log(err));
}

function follow(params, credentials, followId) {
    return fetch('/api/users/follow', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + credentials.t
        },
        body: JSON.stringify({
            userId: params.userId, 
            followId: followId
        })
    }).then((response) => {
        return response.json();
    }).catch((err) => {
        console.log('error: ' + err);
    });
}

function unfollow(params, credentials, unfollowId) {
    return fetch('/api/users/unfollow', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + credentials.t
        },
        body: JSON.stringify({
            userId: params.userId, 
            unfollowId: unfollowId
        })
    }).then((response) => {
        return response.json();
    }).catch((err) => {
        console.log(err);
    });
}

function findPeople(params, credentials) {
    return fetch(`/api/users/findpeople/${params.userId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    }).then((response) => {
        return response.json();
    }).catch((err) => console.log(err));
}

export { create, list, read, update, remove, follow, unfollow, findPeople }