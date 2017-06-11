CREATE PROCEDURE [dbo].[Pages_Shadow_Exists]
	@websiteId int,
	@name nvarchar(250)
AS
	IF (SELECT COUNT(*) FROM Pages WHERE websiteId=1 AND title=@name AND pagetype=2) > 0 BEGIN
		SELECT 1
	END ELSE BEGIN SELECT 0 END
