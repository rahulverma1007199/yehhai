# yehhai

Sql database connection

create database blog;
CREATE TABLE `blog`.`users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(45) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `img` VARCHAR(255) DEFAULT 'defaultUser.png',
    PRIMARY KEY (`id`));

CREATE TABLE `blog`.`posts`(
    `id`    INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,       
    `desc`  TEXT(65505) NOT NULL,      
    `img`   VARCHAR(255) NOT NULL,    
    `date`  DATETIME NOT NULL,     
    `uid`  INT NOT NULL,
    `cat`  VARCHAR(45) NULL,
     PRIMARY KEY (`id`),
    INDEX `uid_idx` (`uid` ASC) VISIBLE,
    CONSTRAINT `uid`
        FOREIGN KEY (`uid`)
        REFERENCES `blog`.`users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE);

ALTER TABLE `blog`.`posts` ADD COLUMN `cat` VARCHAR(45) NULL AFTER `uid`;