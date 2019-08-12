function listNewsFeed(params, credentials) {
    return fetch(`/api/posts/feed/${params.userId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    }).then(response => {
        return response.json();
    }).catch((err) => console.log(err));
}

function listByUser(params, credentials) {
    return fetch(`/api/posts/by/${params.userId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    }).then(response => {
        return response.json();
    }).catch((err) => console.log(err));
}

const create = (params, credentials, post) => {
    return fetch(`/api/posts/new/${params.userId}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: post
    }).then((response) => {
        return response.json();
    }).catch((err) => {
        console.log(err);
    })
}

const remove = (params, credentials) => {
    return fetch(`/api/posts/${params.postId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    }).then((response) => {
        console.log('remove then')
        return response.json();
    }).catch((err) => {
        console.log('remove catch')
        console.log(err);
    })
}

const like = (params, credentials, postId) => {
    return fetch('/api/posts/like/', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify({userId: params.userId, postId: postId})
    }).then((response) => {
        return response.json();
    }).catch((err) => console.log(err));
}

const unlike = (params, credentials, postId) => {
    return fetch('/api/posts/unlike/', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify({userId: params.userId, postId: postId})
    }).then((response) => {
        return response.json();
    }).catch((err) => console.log(err));
}

const comment = (params, credentials, postId, comment) => {
    return fetch('/api/posts/comment/', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify({userId: params.userId, postId: postId, comment: comment})
    }).then(response => {
        return response.json();
    }).catch((err) => console.log(err));
}

export { 
    listNewsFeed, 
    listByUser, 
    create, 
    remove, 
    like, 
    unlike, 
    comment
};