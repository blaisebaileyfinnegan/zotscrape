CREATE TABLE departments (
    dept_id INT NOT NULL AUTO_INCREMENT,
    quarter VARCHAR(3),
    short_name VARCHAR(255) NOT NULL,
    college_title VARCHAR(255),
    college_comment TEXT,
    dept_title VARCHAR(255),
    dept_comment TEXT,
    PRIMARY KEY (dept_id, short_name, quarter)
);

CREATE TABLE courses (
    course_id INT NOT NULL AUTO_INCREMENT,
    dept_id INT NOT NULL,
    number VARCHAR(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE sections (
    section_id INT NOT NULL AUTO_INCREMENT,
    ccode INT NOT NULL,
    course_id INT NOT NULL,
    type VARCHAR(50),
    section VARCHAR(12),
    units VARCHAR(60),
    instructor VARCHAR(255),
    max INT DEFAULT -1,
    enrolled INT DEFAULT -1,
    waitlisted INT DEFAULT -1,
    req INT DEFAULT -1,
    nor INT DEFAULT -1,
    restrictions VARCHAR(255),
    textbooks VARCHAR(255),
    web VARCHAR(255),
    status ENUM('full', 'newonly', 'waitl', 'open'),
    PRIMARY KEY (section_id, ccode),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE finals (
    final_id INT NOT NULL AUTO_INCREMENT,
    section_id INT NOT NULL,
    day VARCHAR(60) NOT NULL,
    start TIME NOT NULL,
    end TIME NOT NULL,
    sunday BOOLEAN NOT NULL DEFAULT false,
    monday BOOLEAN NOT NULL DEFAULT false,
    tuesday BOOLEAN NOT NULL DEFAULT false,
    wednesday BOOLEAN NOT NULL DEFAULT false,
    thursday BOOLEAN NOT NULL DEFAULT false,
    friday BOOLEAN NOT NULL DEFAULT false,
    saturday BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (final_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id)
);


CREATE TABLE meetings (
    meeting_id INT NOT NULL AUTO_INCREMENT,
    section_id INT NOT NULL,
    start TIME NOT NULL,
    end TIME NOT NULL,
    sunday BOOLEAN NOT NULL DEFAULT false,
    monday BOOLEAN NOT NULL DEFAULT false,
    tuesday BOOLEAN NOT NULL DEFAULT false,
    wednesday BOOLEAN NOT NULL DEFAULT false,
    thursday BOOLEAN NOT NULL DEFAULT false,
    friday BOOLEAN NOT NULL DEFAULT false,
    saturday BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (meeting_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id)
);
