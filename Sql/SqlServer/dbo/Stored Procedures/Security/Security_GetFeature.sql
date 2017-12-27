-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/?/2013
-- Description:	
-- =============================================
CREATE PROCEDURE Security_GetFeature
	@websiteId int = 0, 
	@pageId int = 0,
	@userId int = 0,
	@feature nvarchar(50) = ''
AS
BEGIN
	SET NOCOUNT ON;
	SELECT [security] FROM [Security] WHERE websiteId=@websiteId
	AND pageId = CASE WHEN @pageId > 0 THEN @pageId ELSE pageId END
	AND userId=@userId AND feature=@feature

END
