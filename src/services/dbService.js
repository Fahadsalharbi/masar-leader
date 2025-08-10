// src/services/dbService.js
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LeadershipPathDB', 1);

    request.onerror = (event) => {
      console.error('Error opening DB', event);
      reject('Error opening DB');
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // إنشاء مخزن للمشاريع
      if (!db.objectStoreNames.contains('projects')) {
        const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectsStore.createIndex('name', 'name', { unique: false });
      }

      // إنشاء مخزن للمهام
      if (!db.objectStoreNames.contains('tasks')) {
        const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
        tasksStore.createIndex('projectId', 'projectId', { unique: false });
        tasksStore.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

// دوال المشاريع
export const getProjects = (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('projects', 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.getAll();

    request.onerror = (event) => {
      reject('Error getting projects');
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

export const saveProject = (db, project) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('projects', 'readwrite');
    const store = transaction.objectStore('projects');
    const request = store.put(project);

    request.onerror = (event) => {
      reject('Error saving project');
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

export const deleteProject = (db, projectId) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('projects', 'readwrite');
    const store = transaction.objectStore('projects');
    const request = store.delete(projectId);

    request.onerror = (event) => {
      reject('Error deleting project');
    };

    request.onsuccess = (event) => {
      resolve();
    };
  });
};

// دوال المهام
export const getTasks = (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tasks', 'readonly');
    const store = transaction.objectStore('tasks');
    const request = store.getAll();

    request.onerror = (event) => {
      reject('Error getting tasks');
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

export const saveTask = (db, task) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.put(task);

    request.onerror = (event) => {
      reject('Error saving task');
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

export const deleteTask = (db, taskId) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.delete(taskId);

    request.onerror = (event) => {
      reject('Error deleting task');
    };

    request.onsuccess = (event) => {
      resolve();
    };
  });
};
