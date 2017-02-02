CREATE PROCEDURE [dbo].[AddWebsiteSecurity]
	@userId int = 0,
	@websiteId int = 0,
	@pageId int = 0,
	@feature nvarchar(50) = '',
	@security nvarchar(200) = ''

AS
	DECLARE @hasSecurity int = 0;
	SELECT @hasSecurity = COUNT(*) FROM WebsiteSecurity WHERE userId=@userId AND websiteId=@websiteId AND pageId=@pageId AND feature=@feature
	IF(@hasSecurity = 0) BEGIN
		INSERT INTO WebsiteSecurity (websiteId, userId, pageId, feature, security)
		VALUES (@websiteId, @userId, @pageId, @feature, @security)
	END 
