create database netflixdb;

use netflixdb;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name varchar(50) not null,
    is_active boolean,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(25) NOT NULL,
    otp varchar(10) default null,
    created_at datetime default current_timestamp,
    updated_at datetime on update current_timestamp
);

CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    limits int not null default 1,
    type ENUM ('KID', 'ADULT') NOT NULL,
    created_at datetime default current_timestamp,
    updated_at datetime on update current_timestamp,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE contents(
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    type ENUM('movie', 'series') NOT NULL,
    release_date DATE,
    is_active boolean,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE genres(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE actors(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE casts(
    id INT PRIMARY KEY AUTO_INCREMENT,
    actor_id INT,
    content_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES actors(id),
    FOREIGN KEY (content_id) REFERENCES contents(id)
);

CREATE TABLE content_genres(
 id INT PRIMARY KEY AUTO_INCREMENT,
    content_id INT,
    genre_id INT,
    FOREIGN KEY (content_id) REFERENCES contents(id),
    FOREIGN KEY (genre_id) REFERENCES genres(id)
);

CREATE TABLE watch_historys(
        id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    content_id INT,
    watch_date DATE,
    watch_duration TIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (content_id) REFERENCES contents(id)
);