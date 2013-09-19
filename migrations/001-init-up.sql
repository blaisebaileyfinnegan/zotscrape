CREATE TABLE departments (
    dept_id INT NOT NULL AUTO_INCREMENT,
    quarter VARCHAR(3) NOT NULL,
    short_name VARCHAR(32) NOT NULL,
    college_title VARCHAR(255),
    college_comment TEXT,
    dept_title VARCHAR(255),
    dept_comment TEXT,
    PRIMARY KEY (dept_id),
    UNIQUE KEY departments_key (quarter, short_name)
);

CREATE TABLE courses (
    course_id INT NOT NULL AUTO_INCREMENT,
    dept_id INT NOT NULL,
    number VARCHAR(10) NOT NULL,
    title VARCHAR(32) NOT NULL,
    PRIMARY KEY (course_id),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    UNIQUE KEY courses_key (dept_id, number, title)
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
    PRIMARY KEY (section_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE KEY sections_key (course_id, ccode)
);

CREATE TABLE finals (
    final_id INT NOT NULL AUTO_INCREMENT,
    section_id INT NOT NULL,
    day VARCHAR(60) NOT NULL,
    start TIME NOT NULL,
    end TIME NOT NULL,
    PRIMARY KEY (final_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    UNIQUE KEY finals_key (section_id) 
);


CREATE TABLE meetings (
    meeting_id INT NOT NULL AUTO_INCREMENT,
    section_id INT NOT NULL,
    start TIME NOT NULL,
    end TIME NOT NULL,
    place VARCHAR(60),
    sunday BOOLEAN NOT NULL DEFAULT false,
    monday BOOLEAN NOT NULL DEFAULT false,
    tuesday BOOLEAN NOT NULL DEFAULT false,
    wednesday BOOLEAN NOT NULL DEFAULT false,
    thursday BOOLEAN NOT NULL DEFAULT false,
    friday BOOLEAN NOT NULL DEFAULT false,
    saturday BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (meeting_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    UNIQUE KEY meetings_key (section_id, start, end, sunday, monday, tuesday, wednesday, thursday, friday, saturday)
);
