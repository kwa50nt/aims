CREATE TYPE genders AS ENUM ('F', 'M');
CREATE TYPE roles AS ENUM ('Alumni', 'Admin', 'IT');
CREATE TYPE latin_honors AS ENUM ('summa_cum_laude', 'magna_cum_laude', 'cum_laude');

CREATE TABLE userrole (
  role_id BIGSERIAL NOT NULL PRIMARY KEY,
  role_name roles NOT NULL
);

CREATE TABLE webaccount (
  account_id BIGSERIAL NOT NULL PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_token VARCHAR(255),
  is_updated BOOLEAN DEFAULT FALSE,
  CONSTRAINT webaccount_ibfk_1 FOREIGN KEY (role_id) 
    REFERENCES userrole (role_id),
  CONSTRAINT email_format CHECK (
        email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
) ;

CREATE INDEX role_id_idx ON webaccount(role_id);

CREATE TABLE upsealumni (
  alumni_id BIGSERIAL NOT NULL PRIMARY KEY,
  last_name VARCHAR(50) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  suffix VARCHAR(10),
  gender genders,
  student_number VARCHAR(20) NOT NULL UNIQUE,
  entry_date date,
  current_email VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL, 
  current_address VARCHAR(200),
  account_id INT,
  CONSTRAINT upsealumni_ibfk_1 FOREIGN KEY (account_id) 
    REFERENCES webaccount (account_id) ON DELETE CASCADE,
  CONSTRAINT student_number_format 
    CHECK (student_number ~ '^[0-9]{4}-[0-9]{5}$'),
  CONSTRAINT email_format CHECK (
        current_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
  CONSTRAINT phone_number_format CHECK (
      phone_number ~ '^9[0-9]{9}$'
  )
);
CREATE INDEX account_id_idx ON upsealumni(account_id);

CREATE TABLE graduationinfo (
  graduation_id BIGSERIAL NOT NULL PRIMARY KEY,
  alumni_id INT NOT NULL,
  year_started INT NOT NULL,
  semester_started INT NOT NULL,
  year_graduated INT,
  semester_graduated INT,
  latin_honor latin_honors,

  CONSTRAINT graduationinfo_ibfk_1 FOREIGN KEY (alumni_id) 
    REFERENCES upsealumni (alumni_id) ON DELETE CASCADE
);
CREATE INDEX alumni_id_idx ON graduationinfo(alumni_id);

CREATE TABLE employmenthistory (
  employment_id BIGSERIAL NOT NULL PRIMARY KEY,
  alumni_id INT NOT NULL,
  employer VARCHAR(100) NOT NULL,
  last_position_held VARCHAR(100) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  CONSTRAINT employmenthistory_ibfk_1 FOREIGN KEY (alumni_id) 
    REFERENCES upsealumni (alumni_id) ON DELETE CASCADE
);

CREATE TABLE alumnidegrees (
  degree_id BIGSERIAL NOT NULL PRIMARY KEY,
  alumni_id INT NOT NULL,
  degree_name VARCHAR(100) NOT NULL,
  CONSTRAINT alumnidegrees_ibfk_1 FOREIGN KEY (alumni_id) 
    REFERENCES upsealumni (alumni_id) ON DELETE CASCADE
);

CREATE TABLE activeorganizations (
  org_id BIGSERIAL NOT NULL PRIMARY KEY,
  alumni_id INT NOT NULL,
  organization_name VARCHAR(100) NOT NULL,
  CONSTRAINT activeorganizations_ibfk_1 FOREIGN KEY (alumni_id) 
    REFERENCES upsealumni (alumni_id) ON DELETE CASCADE
);
