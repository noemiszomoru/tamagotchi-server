CREATE DATABASE  IF NOT EXISTS `tamagotchi` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `tamagotchi`;
-- MySQL dump 10.13  Distrib 8.0.15, for Win64 (x86_64)
--
-- Host: localhost    Database: tamagotchi
-- ------------------------------------------------------
-- Server version	8.0.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `child_parent`
--

DROP TABLE IF EXISTS `child_parent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `child_parent` (
  `child_id` int(10) unsigned NOT NULL,
  `parent_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`child_id`,`parent_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `child_parent_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`pk`) ON DELETE CASCADE,
  CONSTRAINT `child_parent_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `users` (`pk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `children`
--

DROP TABLE IF EXISTS `children`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `children` (
  `pk` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`pk`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `children_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`pk`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `food`
--

DROP TABLE IF EXISTS `food`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `food` (
  `child_id` int(11) unsigned NOT NULL,
  `date` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `breakfast` decimal(2,1) DEFAULT NULL,
  `soup` decimal(2,1) DEFAULT NULL,
  `main_dish` decimal(2,1) DEFAULT NULL,
  PRIMARY KEY (`date`,`child_id`),
  KEY `child_id` (`child_id`),
  CONSTRAINT `food_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`pk`) ON DELETE CASCADE,
  CONSTRAINT `food_ibfk_2` FOREIGN KEY (`child_id`) REFERENCES `children` (`pk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `groups` (
  `pk` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sleep`
--

DROP TABLE IF EXISTS `sleep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sleep` (
  `child_id` int(10) unsigned NOT NULL,
  `date` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_at` int(11) DEFAULT NULL,
  `end_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`child_id`,`date`),
  CONSTRAINT `sleep_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`pk`) ON DELETE CASCADE,
  CONSTRAINT `sleep_ibfk_2` FOREIGN KEY (`child_id`) REFERENCES `children` (`pk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_token`
--

DROP TABLE IF EXISTS `user_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_token` (
  `pk` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire` int(11) NOT NULL,
  `created` timestamp NOT NULL,
  `refresh_token` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=179 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `pk` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `role` enum('parent','teacher','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'parent',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`pk`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (66,'admin','Noemi Szomoru','noemi.szomoru@gmail.com','noemi.szomoru','$2a$10$1gme/38OChm15iJqgKlQwu/Z1SRlTuNAwxtXH2PRv0whWTqFM64vy');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-06-12 22:01:20
