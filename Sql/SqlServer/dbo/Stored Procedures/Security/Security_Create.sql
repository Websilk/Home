﻿CREATE PROCEDURE [dbo].[Security_Create]
	@userId int = 0,
	@websiteId int = 0,
	@pageId int = 0,
	@feature nvarchar(50) = '',
	@security binary(32)

AS
	DECLARE @hasSecurity int = 0;
	SELECT @hasSecurity = COUNT(*) FROM [Security] WHERE userId=@userId AND websiteId=@websiteId AND pageId=@pageId AND feature=@feature
	IF(@hasSecurity = 0) BEGIN
		INSERT INTO [Security] (websiteId, userId, pageId, feature, security)
		VALUES (@websiteId, @userId, @pageId, @feature, @security)
	END 
