Ext.define('AM.store.Users', {
    extend: 'Ext.data.Store',
    model: 'AM.model.User',
    autoLoad: true,
    
    proxy: {
        type: 'ajax',
        api: {
            read: 'data/users.json',
            update: 'data/updateUsers.json'
        },
        actionMethods : { read : 'GET', update : 'GET' },
        reader: {
            type: 'json',
            rootProperty: 'users',
            successProperty: 'success'
        }
    }
});
